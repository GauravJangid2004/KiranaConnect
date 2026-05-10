import { CartProvider } from './contexts/CartContext.jsx';
import Catalogue from './components/Catalogue.jsx';

export default function App() {
  return (
    <CartProvider>
      <Catalogue />
    </CartProvider>
  );
}
