import { Sidenav } from '@security/layout/Navbar';
import { DarkThemeToggle, useThemeMode } from 'flowbite-react';
import { Outlet } from 'react-router';
import './Styles.css';
import { Content } from '@security/layout/Content';

export function SecurityLayout() {
    const { toggleMode } = useThemeMode();
    return (
        <div className='security-container'>
            <Sidenav>
                <DarkThemeToggle className='cursor-pointer' onToggle={toggleMode} />
            </Sidenav>
            <Content>
                <Outlet />
            </Content>
        </div>
    );
}
