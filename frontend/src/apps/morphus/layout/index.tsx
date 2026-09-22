import { Content } from '@morphus/layout/Content';
import { Navbar } from '@morphus/layout/Navbar';
import { Sidenav } from '@morphus/layout/Sidenav';
import { Outlet } from 'react-router';
import './Styles.css';

export function MorphusLayout() {
    return (
        <div className='morphus-container'>
            <Sidenav />
            <Content>
                <Navbar />
                <Outlet />
            </Content>
        </div>
    );
}
