import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/home";
import AdminLogin from "./pages/admin-login";
import Dashboard from "./pages/dashboard";

// Create a custom system with navy blue theme colors
const customConfig = {
  ...defaultConfig,
  theme: {
    ...defaultConfig.theme,
    tokens: {
      ...defaultConfig.theme?.tokens,
      colors: {
        ...defaultConfig.theme?.tokens?.colors,
        navy: {
          50: { value: "#e6ecf5" },
          100: { value: "#c0d0e8" },
          200: { value: "#96b1d9" },
          300: { value: "#6c92ca" },
          400: { value: "#4d7bbf" },
          500: { value: "#1e3a8a" }, // Main navy blue
          600: { value: "#1a3278" },
          700: { value: "#152a66" },
          800: { value: "#102254" },
          900: { value: "#0a1a42" },
        },
      },
    },
  },
};

const system = createSystem(customConfig);

// Simple routing based on pathname
function Router() {
  const path = window.location.pathname;

  if (path === "/admin/login") {
    return <AdminLogin />;
  }

  if (path === "/admin/dashboard") {
    return <Dashboard />;
  }

  return <Home />;
}

function App() {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
