-- Query para depurar o algoritmo de prioridade de uma reclamação específica
-- Substitua 'ID_DA_RECLAMACAO' pelo UUID que deseja inspecionar.

WITH target_complaint AS (
    SELECT 
        c.*,
        COALESCE(v.votes_count, 0) as votes_count,
        COALESCE(cat.weight, 1) as category_weight,
        EXTRACT(EPOCH FROM (NOW() - c.created_at)) / (24 * 3600) as days_open
    FROM voz_complaints c
    LEFT JOIN (
        SELECT complaint_id, COUNT(*) as votes_count 
        FROM voz_complaint_votes 
        GROUP BY complaint_id
    ) v ON v.complaint_id = c.id
    LEFT JOIN (
        -- Assumindo que a categoria pode ser o ID ou o nome. Se for o ID:
        SELECT id, weight FROM (SELECT id, weight FROM voz_categories UNION ALL SELECT name, weight FROM voz_categories) _
    ) cat ON cat.id = c.category
    WHERE c.id = '5811bc2e-542e-4795-9682-510d19505af7'::uuid
),
spatial_factors AS (
    SELECT 
        tc.id,
        (SELECT COUNT(*) FROM voz_complaints 
         WHERE ST_DWithin(
            ST_SetSRID(ST_Point(lng, lat), 4326)::geography, 
            ST_SetSRID(ST_Point(tc.lng, tc.lat), 4326)::geography, 
            200
         ) AND status != 'resolved' AND id != tc.id
        ) as density_count,
        (SELECT COUNT(*) FROM voz_complaints 
         WHERE ST_DWithin(
            ST_SetSRID(ST_Point(lng, lat), 4326)::geography, 
            ST_SetSRID(ST_Point(tc.lng, tc.lat), 4326)::geography, 
            50
         ) AND created_at > now() - interval '1 year' AND id != tc.id
        ) as recurrence_count
    FROM target_complaint tc
),
severity_factor AS (
    SELECT 
        id,
        CASE 
            WHEN description ILIKE '%morte%' THEN 100
            WHEN description ILIKE '%emergência%' THEN 95
            WHEN description ILIKE '%acidente%' OR description ILIKE '%ferido%' THEN 90
            WHEN description ILIKE '%alagamento%' OR description ILIKE '%grave%' THEN 85
            WHEN description ILIKE '%perigo%' OR description ILIKE '%urgente%' THEN 80
            WHEN description ILIKE '%risco%' THEN 75
            WHEN description ILIKE '%queda%' THEN 70
            ELSE 0
        END as severity_score
    FROM target_complaint
),
factors AS (
    SELECT
        tc.id,
        tc.category_weight * 10 as C,
        LEAST((tc.days_open / 30.0) * 100, 100) as T,
        LEAST((log(1 + tc.votes_count) / log(51)) * 100, 100) as V,
        LEAST((sf.density_count / 20.0) * 100, 100) as D,
        LEAST((sf.recurrence_count / 10.0) * 100, 100) as R,
        sev.severity_score as S,
        -- Adicionado urgency_level como opcional caso o campo ainda não exista no seu dump
        CASE 
            WHEN (SELECT 1 FROM information_schema.columns WHERE table_name='voz_complaints' AND column_name='urgency_level') IS NOT NULL 
            THEN COALESCE(tc.urgency_level, 0)
            ELSE 0 
        END as U,
        (1 + (tc.days_open / 90.0)) as aging
    FROM target_complaint tc
    JOIN spatial_factors sf ON sf.id = tc.id
    JOIN severity_factor sev ON sev.id = tc.id
)
SELECT 
    id as "ID Reclamação",
    ROUND(C::numeric, 2) as "Categoria (C)",
    ROUND(T::numeric, 2) as "Tempo Aberto (T)",
    ROUND(V::numeric, 2) as "Votos (V)",
    ROUND(D::numeric, 2) as "Densidade (D)",
    ROUND(R::numeric, 2) as "Reincidência (R)",
    ROUND(S::numeric, 2) as "Severidade (S)",
    ROUND(U::numeric, 2) as "Urgência (U)",
    ROUND(aging::numeric, 2) as "Aging Factor",
    ROUND(
        (LEAST(
            (C * 0.256) + 
            (T * 0.209) + 
            (V * 0.174) + 
            (D * 0.140) + 
            (R * 0.093) + 
            (S * 0.070) + 
            (U * 0.058),
            100
        ) * aging / 10)::numeric, 
        2
    ) as "Prioridade Final (0-10)"
FROM factors;
