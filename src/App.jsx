import FinanceForm from "./components/FinanceForm"
import Hero from "./components/Hero"
import History from "./components/History"
import Layout from "./components/Layout"
import { useAuth } from "./context/AuthContext"

function App() {
  const { globalUser, globalData, isLoading}  = useAuth()
  // Configure authentication later
  const isAuthenticated = globalUser
  const isData = globalData && !!Object.keys(globalData || {}).length

  

  return (
    <Layout isAuthenticated = {isAuthenticated}>
      <Hero/>
      <FinanceForm isAuthenticated = {isAuthenticated} isData = {isData} isLoading = {isLoading} />
    </Layout>
  )
}

export default App
