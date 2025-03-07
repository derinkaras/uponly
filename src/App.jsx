import { Routes, Route } from "react-router-dom";
import FinanceForm from "./components/FinanceForm";
import Hero from "./components/Hero";
import History from "./components/History";
import Layout from "./components/Layout";
import TrackEverything from "./components/TrackEverything";
import { useAuth } from "./context/AuthContext";

function App() {
  const { globalUser, globalData, isLoading } = useAuth();
  const isAuthenticated = globalUser;
  const isData = globalData && !!Object.keys(globalData || {}).length;

  return (
    <Layout isAuthenticated={isAuthenticated}>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={
          <>
            <Hero />
            <FinanceForm isAuthenticated={isAuthenticated} isData={isData} isLoading={isLoading} />
          </>
        } />
        
        {/* Track Everything Page */}
        <Route path="/track/:type" element={<TrackEverything />} />
      </Routes>
    </Layout>
  );
}

export default App;
