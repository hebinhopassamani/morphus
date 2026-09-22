import { MorphusLayout } from '@morphus/layout';
import { DashboardPage } from '@morphus/pages/Dashboard';
import { SecurityLayout } from '@security/layout';
import { SignInPage } from '@security/pages/SignIn';
import { WebSiteLayout } from '@website/layout';
import { BrowserRouter, Route, Routes } from 'react-router';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<MorphusLayout />}>
                    <Route path='dashboard/:id' element={<DashboardPage>TESTE</DashboardPage>} />
                </Route>
                <Route path='security' element={<SecurityLayout />}>
                    <Route path='signin' element={<SignInPage />} />
                </Route>
                <Route path='home' element={<WebSiteLayout />} />
            </Routes>
        </BrowserRouter>
    );
}
