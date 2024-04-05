import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Test  from "./pages/Test";
import Map from "./pages/Map";
import MapMarker from "./pages/MapMarker";
import LocationDetails from "./pages/LocationsDetails";
import Welcome from "./pages/Welcome";
import ProfilePage from "./pages/ProfilePage";
import Navigation from './components/navbar/Navigation';
import CommunitySection from "./pages/CommunitySection";
import {AuthenticationGuard}  from "./components/authComponents/authentication-guard";


export const RoutesComponent = () =>{
    const { isLoading } = useAuth0();

    if (isLoading) {
        return (
          <div className="page-layout">
             <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div></div>;
          </div>
        );
      }

    return(
        <Router>
            <Navigation/>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/test" element={<AuthenticationGuard component={Test} />} />
                <Route path="/map" element={<AuthenticationGuard component={Map} />}/>
                <Route path="/markedmap" element={<MapMarker />} />
                <Route path="/location/:id" element={<AuthenticationGuard component={LocationDetails} />}/>
                <Route path="/location/community/:id" element={<AuthenticationGuard component={CommunitySection} />}/>
                <Route path="/profile" element={<AuthenticationGuard component={ProfilePage} />}/>
            </Routes>
        </Router>
    )
}