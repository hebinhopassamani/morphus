import { Outlet } from 'react-router';
import { SecContent } from '@website/layout/content';
import { SecNavbar } from '@website/layout/navBar';
import './Styles.css';

export function WebSiteLayout() {
    return (
        <div className='website-container'>
            <SecNavbar />
            <SecContent>
                <Outlet />
            </SecContent>
        </div>
    );
}
