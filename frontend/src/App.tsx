import { ThemeProvider } from 'flowbite-react';
import { AppRoutes } from './routes/app.routes';

export function App() {
    return (
        <>
            <ThemeProvider>
                <AppRoutes />;
            </ThemeProvider>
        </>
    );
}
