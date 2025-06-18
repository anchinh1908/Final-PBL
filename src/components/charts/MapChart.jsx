// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
// import { Bar } from 'react-chartjs-2';
// import 'leaflet/dist/leaflet.css';

// // Sample data: doanh thu theo các tỉnh
// const dataByProvince = [
//   { province: "Hanoi", revenue: 5000000 },
//   { province: "Ho Chi Minh", revenue: 7000000 },
//   { province: "Da Nang", revenue: 3000000 },
//   { province: "Hue", revenue: 2000000 },
//   { province: "Can Tho", revenue: 1000000 },
// ];

// const mapData = [
//   {
//     type: "Feature",
//     properties: { name: "Hanoi", revenue: 5000000 },
//     geometry: {
//       type: "Polygon",
//       coordinates: [[[105.854, 21.028], [105.854, 21.018], [105.844, 21.018], [105.844, 21.028]]], // Vị trí giả
//     },
//   },
//   {
//     type: "Feature",
//     properties: { name: "Ho Chi Minh", revenue: 7000000 },
//     geometry: {
//       type: "Polygon",
//       coordinates: [[[106.692, 10.762], [106.692, 10.752], [106.682, 10.752], [106.682, 10.762]]],
//     },
//   },
//   // Add more provinces here
// ];

// const RevenueMapChart = () => {
//   const [chartData, setChartData] = useState({});

//   // Cập nhật dữ liệu chart khi dữ liệu map thay đổi
//   useEffect(() => {
//     const labels = dataByProvince.map(item => item.province);
//     const revenueData = dataByProvince.map(item => item.revenue);

//     setChartData({
//       labels: labels,
//       datasets: [
//         {
//           label: 'Doanh Thu (VND)',
//           data: revenueData,
//           backgroundColor: 'rgba(75, 192, 192, 0.6)',
//           borderColor: 'rgba(75, 192, 192, 1)',
//           borderWidth: 1,
//         },
//       ],
//     });
//   }, []);

//   return (
//     <div style={{ display: 'flex', height: '500px' }}>
//       <MapContainer center={[14.0583, 108.2772]} zoom={6} style={{ width: '70%', height: '100%' }}>
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         {mapData.map((province, index) => (
//           <GeoJSON
//             key={index}
//             data={province}
//             style={{
//               color: 'blue',
//               weight: 2,
//               fillColor: 'rgba(0, 166, 169, 0.6)',
//               fillOpacity: 0.5,
//             }}
//           >
//             <Popup>{province.properties.name}: {province.properties.revenue} VND</Popup>
//           </GeoJSON>
//         ))}
//       </MapContainer>

//       <div style={{ width: '30%', paddingLeft: '20px' }}>
//         <Bar data={chartData} />
//       </div>
//     </div>
//   );
// };

// export default RevenueMapChart;

import { MapContainer, TileLayer } from "react-leaflet"
import { useRef, useState } from "react"
import "leaflet/dist/leaflet.css"
import "~/styles/Chart.css"
import CircleIcon from "@mui/icons-material/Circle"

const RevenueMapChart = () => {
    const [center, setCenter] = useState({ lat: 15.87, lng: 108.334 })
    const ZOOM_LEVEL = 9
    const mapRef = useRef()
    const mapUrl = `${import.meta.env.VITE_MAPTILER_URL}?key=${import.meta.env.VITE_MAPTILER_KEY}`;
    const mapAttribution = import.meta.env.VITE_MAPTILER_ATTRIBUTION

    return (
        <div>
            <h1 className="chart-title mb-2">Top 5 thương hiệu bán chạy nhất</h1>

            <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef} className="map-container">
                <TileLayer url={mapUrl} attribution={mapAttribution} />
            </MapContainer>

            <div className="ml-5">
                <h1>Chú thích</h1>
                <div className="flex text-justify">
                    <CircleIcon sx={{ fontSize: 15 }} className="text-red-500 mr-1 mt-1" />
                    Nếu bạn muốn nhãn hiển thị đặc biệt ở cuối trục (trên cùng hoặc dưới cùng), bạn
                    cần sử dụng ticks
                </div>
            </div>
        </div>
    )
}

export default RevenueMapChart
