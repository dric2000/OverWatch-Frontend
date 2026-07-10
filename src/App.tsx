import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";

import { store } from "./app/features/store";
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#0F172A",
            border: "1px solid #E2E8F0",
          },
          success: {
            icon: "✅",
            style: {
              borderLeft: "4px solid #0E7C86",
            },
          },
          error: {
            icon: "❌",
            style: {
              borderLeft: "4px solid #DC2626",
            },
          },
        }}
      />
    </Provider>
  );
}

export default App;
