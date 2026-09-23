// import type { MpxCardProps } from '@components/Card/card.structures';
// import { useThemeProvider } from 'flowbite-react';
// import { get } from 'flowbite-react/helpers/get';
// import { resolveProps } from 'flowbite-react/helpers/resolve-props';
// import { useResolveTheme } from 'flowbite-react/helpers/resolve-theme';
// import { twMerge } from 'flowbite-react/helpers/tailwind-merge';
// import { forwardRef } from 'react';

// export const MpxCard = forwardRef<HTMLDivElement, MpxCardProps>((props, ref) => {
//     //const [mpxThem, setMpxTheme] = useState(new MorphusTheme().theme);

//     const provider = useThemeProvider();

//     const theme = useResolveTheme(
//         [cardTheme, provider.theme?.carTheme, props.theme],
//         [get(provider.clearTheme, 'card'), props.clearTheme],
//         [get(provider.applyTheme, 'card'), props.applyTheme]
//     );

//     const { children, className, ...restProps } = resolveProps(props, provider.props?.cardProps);

//     return (
//         <div
//             ref={ref}
//             className={twMerge(theme.base, className)}
//             {...restProps}
//         >
//             {children}
//         </div>
//     );
// });
