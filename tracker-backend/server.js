const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: "*" })); 

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let trucks = [
    {
        id: "TRUCK-01",
        driver: "นาย A",
        license: "AA-1111 BKK",
        cargo: "กรุงเทพ - นครราชสีมา",
        status: "กำลังจัดส่ง",
        currentStep: 0,
        waypoints: [
            { lat: 13.7563, lng: 100.5018, name: "คลังสินค้าหลัก กรุงเทพฯ" },
            { lat: 14.0208, lng: 100.6125, name: "ถ.พหลโยธิน (รังสิต)" },
            { lat: 14.2144, lng: 100.7221, name: "ประตูน้ำพระอินทร์ (อยุธยา)" },
            { lat: 14.3589, lng: 100.8912, name: "ถ.มิตรภาพ (ตัวเมืองสระบุรี)" },
            { lat: 14.5244, lng: 101.1032, name: "ทับกวาง / แก่งคอย" },
            { lat: 14.6900, lng: 101.4200, name: "อ.ปากช่อง (นครราชสีมา)" },
            { lat: 14.8211, lng: 101.5833, name: "ริมเขื่อนลำตะคอง" },
            { lat: 14.8955, lng: 101.8122, name: "ต่างระดับสีคิ้ว" },
            { lat: 14.9738, lng: 102.0831, name: "ร้านค้าปลายทาง เมืองโคราช" }
        ]
    },
    {
        id: "TRUCK-02",
        driver: "นาย B",
        license: "BB-2222 BKK",
        cargo: "กรุงเทพ - เชียงใหม่",
        status: "กำลังจัดส่ง",
        currentStep: 0,
        waypoints: [
            { lat: 13.7563, lng: 100.5018, name: "คลังสินค้าหลัก กรุงเทพฯ" },
            { lat: 14.3000, lng: 100.5600, name: "สายเอเชีย (พระนครศรีอยุธยา)" },
            { lat: 14.9500, lng: 100.2400, name: "ทางหลวงหมายเลข 32 (สิงห์บุรี)" },
            { lat: 15.6900, lng: 100.1200, name: "เลี่ยงเมืองนครสวรรค์" },
            { lat: 16.8200, lng: 99.2500, name: "ถ.พหลโยธิน (ตาก)" },
            { lat: 18.2800, lng: 99.4900, name: "แยกภาคเหนือ (ลำปาง)" },
            { lat: 18.5800, lng: 99.0400, name: "อ.เมืองลำพูน" },
            { lat: 18.7883, lng: 98.9853, name: "ร้านค้าปลายทาง เมืองเชียงใหม่" }
        ]
    },
    {
        id: "TRUCK-03",
        driver: "นาย C",
        license: "CC-3333 BKK",
        cargo: "กรุงเทพ - ภูเก็ต",
        status: "กำลังจัดส่ง",
        currentStep: 0,
        waypoints: [
            { lat: 13.7563, lng: 100.5018, name: "คลังสินค้าหลัก กรุงเทพฯ" },
            { lat: 13.4100, lng: 100.0000, name: "ถ.พระราม 2 (สมุทรสงคราม)" },
            { lat: 13.1100, lng: 99.9300, name: "ถ.เพชรเกษม (เพชรบุรี)" },
            { lat: 11.8100, lng: 99.7900, name: "อ.เมืองประจวบคีรีขันธ์" },
            { lat: 10.4900, lng: 99.1800, name: "แยกปฐมพร (ชุมพร)" },
            { lat: 9.1400, lng: 99.3300, name: "ถ.เลี่ยงเมืองสุราษฎร์ธานี" },
            { lat: 8.4500, lng: 98.5200, name: "อ.เมืองพังงา" },
            { lat: 8.2000, lng: 98.3000, name: "สะพานสารสิน (เข้าสู่ภูเก็ต)" },
            { lat: 7.8804, lng: 98.3922, name: "ร้านค้าปลายทาง เมืองภูเก็ต" }
        ]
    }
];

// ส่งพิกัดรถทุกๆ 3 วินาที
setInterval(() => {
    trucks.forEach(truck => {
        if (truck.currentStep < truck.waypoints.length) {
            const currentCoords = truck.waypoints[truck.currentStep];

            const payload = {
                id: truck.id,
                driver: truck.driver,
                license: truck.license,
                cargo: truck.cargo,
                status: truck.status,
                lat: currentCoords.lat,
                lng: currentCoords.lng,
                locationName: currentCoords.name,
                timestamp: new Date().toLocaleTimeString()
            };

            io.emit('truck-move', payload);
            console.log(`[Backend] ส่งข้อมูล ${truck.id} จุดที่ ${truck.currentStep + 1}/${truck.waypoints.length}`);

            truck.currentStep++;

            if (truck.currentStep === truck.waypoints.length) {
                truck.status = "จัดส่งสำเร็จ";
                io.emit('truck-move', { ...payload, status: "จัดส่งสำเร็จ" });
                console.log(`[Backend] ${truck.id} ถึงจุดหมายปลายทางแล้ว! (จัดส่งสำเร็จ)`);
                
                setTimeout(() => {
                    truck.currentStep = 0;
                    truck.status = "กำลังจัดส่ง";
                }, 5000);
            }
        }
    });
}, 3000);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});