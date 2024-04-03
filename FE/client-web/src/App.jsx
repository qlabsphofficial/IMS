import {
  BrowserRouter as Router, Routes, Route
} from 'react-router-dom'
import { ThemeProvider } from '@emotion/react';
import theme from './theme';

//Site Pages
import RootLayout from './layouts/root-layout';
import CommissaryLayout from './layouts/root-layout/commissary_nav';
import SignIn from './pages/sign-in'

// CAFE
import TransferHistoryPage from './pages/Cafe/transfer_history';
import ProfilePage from './pages/Cafe/profile';
import CafeAnalysis from './pages/Cafe/analysis';
import CafeInventoryPage from './pages/Cafe/menu';
import CafeNotifications from './pages/Cafe/notifications';

// COMMISSARY
import CommissaryInventoryPage from './pages/Commissary/commissary_inventory';
import CommissaryTransferHistoryPage from './pages/Commissary/item_requests';
import CommissaryAnalyis from './pages/Commissary/analysis';

import "./App.css"


const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* PATHS UNDER LOGGED IN USER */}
          <Route path="/cafe" element={<RootLayout />}>
            <Route path="transfer_history" element={<TransferHistoryPage />} />
            <Route path="analysis" element={<CafeAnalysis />} />
            <Route path="notifications" element={<CafeNotifications />} />
            <Route path="cafeinventory" element={<CafeInventoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* COMMISSARY */}
          <Route path="/commissary" element={<CommissaryLayout />}>
            <Route path="/commissary/transfer_history" element={<CommissaryTransferHistoryPage />} />
            <Route path="/commissary/analysis" element={<CommissaryAnalyis />} />
            <Route path="/commissary/notifications" element={<CafeNotifications />} />
            <Route path="/commissary/inventory" element={<CommissaryInventoryPage />} />
            <Route path="/commissary/profile" element={<ProfilePage />} />
          </Route>

          {/* LOGIN PATH */}
          <Route path="/" element={<SignIn />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App;
