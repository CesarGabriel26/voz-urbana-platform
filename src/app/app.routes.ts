import { Routes } from '@angular/router';
import { HomePage } from './modules/home-page/home-page.component';
import { LoginPage } from './modules/login-page/login-page.component';
import { SignupPage } from './modules/signup-page/signup-page.component';
import { authGuard } from './guards/auth.guard';
import { MainLayoutComponent } from './modules/main-layout/main-layout.component';
import { PetitionCreatePage } from './modules/petition/petition-create-page/petition-create-page.component';
import { ComplaintListPage } from './modules/complaint/complaint-list-page/complaint-list-page.component';
import { ComplaintCreatePage } from './modules/complaint/complaint-create-page/complaint-create-page.component';
import { PetitionListPage } from './modules/petition/petition-list-page/petition-list-page.component';
import { ComplaintDetailPage } from './modules/complaint/complaint-detail-page/complaint-detail-page.component';
import { PetitionDetailPage } from './modules/petition/petition-detail-page/petition-detail-page.component';
import { AboutPage } from './modules/about-page/about-page.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: HomePage,
                title: 'Voz Urbana - Home',
            },
            {
                path: 'about',
                title: 'Voz Urbana - Sobre',
                component: AboutPage
            },
            {
                path: 'complaints',
                title: 'Voz Urbana - Reclamações',
                component: ComplaintListPage
            },
            {
                path: 'complaint/create',
                title: 'Voz Urbana - Criar Reclamação',
                component: ComplaintCreatePage,
                canActivate: [authGuard]
            },
            {
                path: 'complaint/:id',
                title: 'Voz Urbana - Detalhes da Reclamação',
                component: ComplaintDetailPage
            },
            {
                path: 'mycomplaints',
                title: 'Voz Urbana - Minhas Reclamações',
                component: ComplaintListPage,
                canActivate: [authGuard],
                data: { isMyComplaints: true }
            },
            {
                path: 'petitions',
                title: 'Voz Urbana - Abaixo-Assinados',
                component: PetitionListPage
            },
            {
                path: 'petition/create',
                title: 'Voz Urbana - Criar Abaixo-Assinado',
                component: PetitionCreatePage,
                canActivate: [authGuard]
            },
            {
                path: 'petition/:id',
                title: 'Voz Urbana - Detalhes do Abaixo-Assinado',
                component: PetitionDetailPage
            },
            {
                path: 'mypetitions',
                title: 'Voz Urbana - Meus Abaixo-Assinados',
                component: PetitionListPage,
                data: { isMyPetitions: true }
            }
        ]
    },
    {
        path: 'login',
        title: 'Voz Urbana - Login',
        component: LoginPage
    },
    {
        path: 'signup',
        title: 'Voz Urbana - Cadastro',
        component: SignupPage
    }
];
