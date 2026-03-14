// export function getPriorityColor(priority: number) {

//     const normalized = priority / 10

//     const index = Math.floor(
//         normalized * (PrioritiesColors.length - 1)
//     )

//     return PrioritiesColors[index]
// }

export function getPriorityColor(priority: number) {

    const clamped = Math.max(0, Math.min(priority, 10))

    const normalized = Math.pow(clamped / 10, 1.5)
    const hue = 120 - normalized * 120

    // const hue = 120 - (clamped / 10) * 120

    return `hsl(${hue}, 100%, 45%)`
}