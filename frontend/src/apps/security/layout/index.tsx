import { DarkThemeToggle, useThemeMode } from 'flowbite-react';
import { Outlet } from 'react-router';
import { SecNavbar } from '@security/layout/navbar';
import { SecContent } from '@security/layout/content';
import './styles.css';

export function SecurityLayout() {
    const { toggleMode } = useThemeMode();
    return (
        <div className='security-container'>
            <SecNavbar>
                <DarkThemeToggle className='cursor-pointer  mpx-' onToggle={toggleMode} />
            </SecNavbar>
            <SecContent>
                <Outlet />
            </SecContent>
        </div>
    );
}
