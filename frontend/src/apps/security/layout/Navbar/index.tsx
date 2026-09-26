import type { MorphusProps } from '@core/types/morphus.type';

export type SecNavbarProps = {} & MorphusProps;

export function SecNavbar({ children }: SecNavbarProps) {
	return (
		<div className='security-navbar shadow-lg bg-heber! shadow-black/50 border-b border-b-gray-300'>
			{children}
			<label className='bg-t-heber'>Teste de Titulo</label>
		</div>
	);
}
