import { useEffect } from "react";
import { Button, Text, useTheme } from "astralis-ui";

function App() {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme == 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="">

    </div>
  );
}

export default App;
