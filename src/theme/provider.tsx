// // src/theme/provider.tsx
// "use client";
// import React, { createContext, useContext, useEffect, useState } from "react";

// export type Theme = "light" | "dark" | "system";

// interface ThemeProviderProps {
//   children: React.ReactNode;
//   defaultTheme?: Theme;
//   storageKey?: string;
//   className?: string;
// }

// interface ThemeProviderState {
//   theme: Theme;
//   setTheme: (theme: Theme) => void;
//   resolvedTheme: "light" | "dark";
// }

// const initialState: ThemeProviderState = {
//   theme: "system",
//   setTheme: () => null,
//   resolvedTheme: "light",
// };

// const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// export function AstralisProvider({
//   children,
//   defaultTheme = "system",
//   storageKey = "astralis-ui-theme",
//   className = "",
//   ...props
// }: ThemeProviderProps) {
//   const [theme, setTheme] = useState<Theme>(defaultTheme);
//   const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

//   useEffect(() => {
//     const stored = localStorage.getItem(storageKey);
//     if (stored) {
//       setTheme(stored as Theme);
//     }
//   }, [storageKey]);

//   useEffect(() => {
//     const root = window.document.documentElement;
//     console.log(root);
//     console.log(theme);
    

//     // Remove any existing theme classes
//     root.classList.remove("light", "dark");

//     let themeToApply: "light" | "dark";
//     if (theme === "system") {
//       themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches
//         ? "dark"
//         : "light";
//     } else {
//       themeToApply = theme;
//     }

//     // Apply the theme class - Tailwind uses 'dark' class for dark mode
//     if (themeToApply === "dark") {
//       root.classList.add("dark");
//     } else {
//       root.classList.remove("dark");
//     }

//     setResolvedTheme(themeToApply);

//     // Store the preference
//     if (theme !== "system") {
//       localStorage.setItem(storageKey, theme);
//     } else {
//       localStorage.removeItem(storageKey);
//     }
//   }, [theme, storageKey]);

//   const value = {
//     theme,
//     setTheme: (theme: Theme) => {
//       setTheme(theme);
//     },
//     resolvedTheme,
//   };

//   return (
//     <ThemeProviderContext.Provider {...props} value={value}>
//       <div className={`astralis ${className}`}>{children}</div>
//     </ThemeProviderContext.Provider>
//   );
// }

// export const useTheme = () => {
//   const context = useContext(ThemeProviderContext);

//   if (context === undefined) {
//     throw new Error("useTheme must be used within a AstralisProvider");
//   }

//   return context;
// };

// src/theme/provider.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  className?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function AstralisProvider({
  children,
  defaultTheme = "system",
  storageKey = "astralis-ui-theme",
  className = "",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read from localStorage only once on initial render
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      return stored as Theme || defaultTheme;
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // This useEffect will now only handle the resolved theme logic.
  useEffect(() => {
    // This logic is for the application, not Storybook.
    // Storybook is already handling the `dark` class for you.
    let themeToApply: "light" | "dark";
    if (theme === "system") {
      themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      themeToApply = theme;
    }

    setResolvedTheme(themeToApply);

    // Persist to local storage.
    if (theme !== "system") {
      localStorage.setItem(storageKey, theme);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <div className={`astralis ${className}`}>{children}</div>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a AstralisProvider");
  }

  return context;
};
