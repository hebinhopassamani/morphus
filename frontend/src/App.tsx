import { ThemeProvider } from 'flowbite-react';
import './App.css';
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
