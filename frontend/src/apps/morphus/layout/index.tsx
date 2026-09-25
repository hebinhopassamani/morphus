import { MpxContent } from '@morphus/layout/content';
import { MpxNavbar } from '@morphus/layout/navbar';
import { MpxSidenav } from '@morphus/layout/sidenav';
import { Outlet } from 'react-router';
import './styles.css';

export function MorphusLayout() {
	return (
		<div className='morphus-container'>
			<MpxSidenav />
			<MpxContent>
				<MpxNavbar />
				<Outlet />
			</MpxContent>
		</div>
	);
}
