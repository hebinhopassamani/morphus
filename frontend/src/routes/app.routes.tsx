import { MorphusLayout } from '@morphus/layout';
import { MpxDashboardPage } from '@morphus/pages/dashboard';
import { SecurityLayout } from '@security/layout';
import { SecSignInPage } from '@security/pages/sign-in';
import { WebSiteLayout } from '@website/layout';
import { BrowserRouter, Route, Routes } from 'react-router';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<MorphusLayout />}>
                    <Route path='dashboard/:id' element={<MpxDashboardPage>TESTE</MpxDashboardPage>} />
                </Route>
                <Route path='security' element={<SecurityLayout />}>
                    <Route path='signin' element={<SecSignInPage />} />
                </Route>
                <Route path='home' element={<WebSiteLayout />} />
            </Routes>
        </BrowserRouter>
    );
}
