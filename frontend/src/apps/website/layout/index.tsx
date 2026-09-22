import { Outlet } from 'react-router';
import { Content } from '@website/layout/Content';
import { Navbar } from '@website/layout/NavBar';
import './Styles.css';

export function WebSiteLayout() {
    return (
        <div className='website-container'>
            <Navbar />
            <Content>
                <Outlet />
            </Content>
        </div>
    );
}
