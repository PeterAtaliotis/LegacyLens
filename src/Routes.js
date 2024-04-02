import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Test  from "./pages/Test";
import Map from "./pages/Map";
import MapMarker from "./pages/MapMarker";
import LocationDetails from "./pages/LocationsDetails";




export const RoutesComponent = () =>{
    return(
        <Router>
            <Routes>
                <Route path="/test" element={<Test />} />
                <Route path="/map" element={<Map />} />
                <Route path="/markedmap" element={<MapMarker />} />
                <Route path="/location/:id" element={<LocationDetails />} />
            </Routes>
        </Router>
    )
}