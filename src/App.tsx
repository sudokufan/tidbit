// import { Route, Routes } from "react-router-dom";

// import IndexPage from "@/pages/index";
// import DocsPage from "@/pages/docs";
// import PricingPage from "@/pages/pricing";
// import BlogPage from "@/pages/blog";
// import AboutPage from "@/pages/about";
import { Auth } from "./components/auth";
import { TidbitForm } from "./components/tidbitForm";
import { TidbitFeed } from "./components/tidbitFeed";
import { auth } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function App() {
  const [user] = useAuthState(auth);
  return (
    // <Routes>
    //   <Route element={<IndexPage />} path="/" />
    //   <Route element={<DocsPage />} path="/docs" />
    //   <Route element={<PricingPage />} path="/pricing" />
    //   <Route element={<BlogPage />} path="/blog" />
    //   <Route element={<AboutPage />} path="/about" />
    // </Routes>

    <div className="flex flex-col items-center p-4">
      {user ? (
        <>
          <TidbitForm />
          <TidbitFeed />
        </>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;
