import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import {
  ActivityOverviewPage,
  HealthMetricsPage,
  TrainingStatusPage,
} from './pages/DashboardPages'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<ActivityOverviewPage />} />
        <Route path="health" element={<HealthMetricsPage />} />
        <Route path="training" element={<TrainingStatusPage />} />
        <Route path="profile" element={<ActivityOverviewPage />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  )
}

export default App
