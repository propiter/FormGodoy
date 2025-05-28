import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { OrderProvider } from '@/context/OrderContext';
import { DataProvider } from '@/context/DataContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import NewOrderPage from '@/pages/NewOrderPage';
import UpdateOrderPage from '@/pages/UpdateOrderPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <DataProvider>
        <OrderProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/new-order" element={<NewOrderPage />} />
                <Route path="/update-order" element={<UpdateOrderPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
          <Toaster />
        </OrderProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App