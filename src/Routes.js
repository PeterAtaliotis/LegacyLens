import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Test  from "./pages/Test";
import Map from "./pages/Map";
import MapMarker from "./pages/MapMarker";
import LocationDetails from "./pages/LocationsDetails";
import Welcome from "./pages/Welcome";
import Navigation from './components/navbar/Navigation';
import CommunitySection from "./pages/CommunitySection";







export const RoutesComponent = () =>{
    return(
        <Router>
            <Navigation/>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/test" element={<Test />} />
                <Route path="/map" element={<Map />} />
                <Route path="/markedmap" element={<MapMarker />} />
                <Route path="/location/:id" element={<LocationDetails />}/>
                <Route path="/location/community/:id" element={<CommunitySection />}/>
            </Routes>
        </Router>
    )
}