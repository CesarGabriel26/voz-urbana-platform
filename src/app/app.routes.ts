import { Routes } from '@angular/router';
import { HomePage } from './modules/home-page/home-page.component';
import { LoginPage } from './modules/login-page/login-page.component';
import { SignupPage } from './modules/signup-page/signup-page.component';
import { authGuard } from './guards/auth.guard';
import { MainLayoutComponent } from './modules/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: MainLayoutComponent,
        // canActivate: [authGuard]
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: HomePage,
                title: 'Voz Urbana - Home',
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
