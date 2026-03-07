import { Routes } from '@angular/router';
import { HomePage } from './modules/home-page/home-page.component';
import { LoginPage } from './modules/login-page/login-page.component';
import { SignupPage } from './modules/signup-page/signup-page.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        title: 'Voz Urbana - Home',
        component: HomePage
        // canActivate: [authGuard]
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
