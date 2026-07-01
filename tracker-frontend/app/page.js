"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Script from "next/script";

export default function LogisticsDashboard() {
  const [trucksData, setTrucksData] = useState({
    "TRUCK-01": {
      driver: "-",
      license: "-",
      cargo: "-",
      lat: 0,
      lng: 0,
      locationName: "-",
      timestamp: "-",
      status: "รอข้อมูลจำลอง...",
    },
    "TRUCK-02": {
      driver: "-",
      license: "-",
      cargo: "-",
      lat: 0,
      lng: 0,
      locationName: "-",
      timestamp: "-",
      status: "รอข้อมูลจำลอง...",
    },
    "TRUCK-03": {
      driver: "-",
      license: "-",
      cargo: "-",
      lat: 0,
      lng: 0,
      timestamp: "-",
      status: "รอข้อมูลจำลอง...",
    },
  });

  // State เปิด/ปิด หน้าต่างรายละเอียด (Modal)
  const [activeModalId, setActiveModalId] = useState(null);

  // Mock ข้อมูลรายละเอียดสินค้าบนรถแต่ละคัน
  const cargoDetailsMock = {
    "TRUCK-01": {
      type: "กระเบื้องเซรามิกปูพื้น (Porcelain)",
      size: "60x60 ซม.",
      quantity: "500 กล่อง",
      weight: "12.5 ตัน",
      invoice: "IV-20260701-001",
    },
    "TRUCK-02": {
      type: "กระเบื้องแกรนิตโต้ผิวมัน (Granito)",
      size: "80x80 ซม.",
      quantity: "400 กล่อง",
      weight: "14.2 ตัน",
      invoice: "IV-20260701-002",
    },
    "TRUCK-03": {
      type: "กระเบื้องยางยางลายไม้ (SPC Tiles)",
      size: "15x90 ซม.",
      quantity: "800 กล่อง",
      weight: "8.9 ตัน",
      invoice: "IV-20260701-003",
    },
  };

  const mockUser = {
    name: "ชื่อ นามสุกล",
    nickname: "AA",
    role: "เจ้าหน้าที่ฝ่ายปฏิบัติการขนส่ง",
    department: "แผนกโลจิสติกส์และกระจายสินค้า",
  };

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const [isMapReady, setIsMapReady] = useState(false);

  const routesData = {
    "TRUCK-01": [
      [13.7563, 100.5018],
      [14.0208, 100.6125],
      [14.2144, 100.7221],
      [14.3589, 100.8912],
      [14.5244, 101.1032],
      [14.69, 101.42],
      [14.8211, 101.5833],
      [14.8955, 101.8122],
      [14.9738, 102.0831],
    ],
    "TRUCK-02": [
      [13.7563, 100.5018],
      [14.3, 100.56],
      [14.95, 100.24],
      [15.69, 100.12],
      [16.82, 99.25],
      [18.28, 99.49],
      [18.58, 99.04],
      [18.7883, 98.9853],
    ],
    "TRUCK-03": [
      [13.7563, 100.5018],
      [13.41, 100.0],
      [13.11, 99.93],
      [11.81, 99.79],
      [10.49, 99.18],
      [9.14, 99.33],
      [8.45, 98.52],
      [8.2, 98.3],
      [7.8804, 98.3922],
    ],
  };

  function initLeafletMap() {
    if (!leafletMapRef.current && mapRef.current && window.L) {
      const L = window.L;
      leafletMapRef.current = L.map(mapRef.current).setView([14.1, 101.0], 8);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors © CARTO",
        },
      ).addTo(leafletMapRef.current);

      L.polyline(routesData["TRUCK-01"], {
        color: "#f97316",
        weight: 4,
        opacity: 0.6,
        dashArray: "5, 10",
      }).addTo(leafletMapRef.current);
      L.polyline(routesData["TRUCK-02"], {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.6,
        dashArray: "5, 10",
      }).addTo(leafletMapRef.current);
      L.polyline(routesData["TRUCK-03"], {
        color: "#a855f7",
        weight: 4,
        opacity: 0.6,
        dashArray: "5, 10",
      }).addTo(leafletMapRef.current);

      setIsMapReady(true);
    }
  }

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("truck-move", (data) => {
      setTrucksData((prevData) => ({
        ...prevData,
        [data.id]: {
          driver: data.driver,
          license: data.license,
          cargo: data.cargo || "ขนส่งกระเบื้องตามรอบการวิ่ง",
          lat: data.lat,
          lng: data.lng,
          locationName: data.locationName,
          timestamp: data.timestamp,
          status: data.status,
        },
      }));

      if (window.L && leafletMapRef.current) {
        const L = window.L;
        const truckIcon = L.divIcon({
          html:
            `<div class="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 border-2 ${
              data.id === "TRUCK-01"
                ? "border-orange-500"
                : data.id === "TRUCK-02"
                  ? "border-blue-500"
                  : "border-purple-500"
            } shadow-xl text-xl" style="transition: transform 3s linear !important;">` +
            (data.status === "จัดส่งสำเร็จ" ? "✅" : "🚛") +
            `</div>`,
          className: "custom-truck-wrapper",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        if (!markersRef.current[data.id]) {
          markersRef.current[data.id] = L.marker([data.lat, data.lng], {
            icon: truckIcon,
          })
            .addTo(leafletMapRef.current)
            .bindPopup(`<b>${data.id}</b><br>สถานะ: ${data.status}`);
        } else {
          markersRef.current[data.id].setLatLng([data.lat, data.lng]);
          markersRef.current[data.id].setPopupContent(
            `<b>${data.id}</b><br>สถานะ: ${data.status}`,
          );
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isMapReady]);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-4 lg:p-6 font-sans relative">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={initLeafletMap}
      />

      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-white flex items-center gap-2">
              ระบบติดตามรถขนส่งสินค้า
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 pl-4 pr-5 py-2 rounded-xl border border-slate-800 text-right">
          <div className="text-xs">
            <p className="font-semibold text-slate-200">
              {mockUser.name} ({mockUser.nickname})
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{mockUser.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white shadow-md">
            {mockUser.nickname[0]}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* แผนที่แสดงรถเดินทาง */}
        <div className="xl:col-span-3">
          <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
            <style>{`.leaflet-marker-icon { transition: transform 3s linear !important; }`}</style>
            <div
              ref={mapRef}
              style={{ width: "100%", height: "620px" }}
              className="rounded-xl bg-slate-950 z-10"
            ></div>
          </div>
        </div>

        {/* รายละเอียด */}
        <div className="space-y-4 xl:col-span-1">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              รถจัดส่งสินค้า (คลิกเพื่อดูรายละเอียด)
            </h2>
          </div>

          {Object.entries(trucksData).map(([id, truck]) => {
            const borderColor =
              id === "TRUCK-01"
                ? "border-orange-500"
                : id === "TRUCK-02"
                  ? "border-blue-500"
                  : "border-purple-500";
            return (
              <div
                key={id}
                onClick={() => setActiveModalId(id)}
                className={`bg-slate-900 p-4 rounded-2xl border-l-4 ${borderColor} border-y border-r border-slate-800 shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:bg-slate-800/80`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white text-base flex items-center gap-1.5">
                    {id}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      truck.status === "จัดส่งสำเร็จ"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {truck.status}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>
                    {truck.driver}{" "}
                    <span className="text-slate-500">({truck.license})</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {truck.cargo}
                  </p>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>
                        {new Date().toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <span>{truck.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-orange-400 font-medium bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800/40 truncate">
                      {truck.locationName}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*Modal รายละเอียดสินค้า*/}
      {activeModalId && (
        <div className="fixed inset-0 z-5000 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setActiveModalId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-lg p-1"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              รายละเอียดใบกำกับและการโหลดสินค้า ({activeModalId})
            </h3>

            <div className="space-y-3.5 text-sm text-slate-300">
              <div className="grid grid-cols-3 border-b border-slate-800/40 pb-2">
                <span className="text-slate-500">เลขที่ใบส่งของ:</span>
                <span className="col-span-2 font-mono text-orange-400 font-medium">
                  {cargoDetailsMock[activeModalId].invoice}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-800/40 pb-2">
                <span className="text-slate-500">พนักงานขับรถ:</span>
                <span className="col-span-2 text-slate-200">
                  {trucksData[activeModalId].driver} (
                  {trucksData[activeModalId].license})
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-800/40 pb-2">
                <span className="text-slate-500">ประเภทกระเบื้อง:</span>
                <span className="col-span-2 text-slate-200">
                  {cargoDetailsMock[activeModalId].type}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-800/40 pb-2">
                <span className="text-slate-500">ขนาดสินค้า:</span>
                <span className="col-span-2 text-slate-200">
                  {cargoDetailsMock[activeModalId].size}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-800/40 pb-2">
                <span className="text-slate-500">จำนวนจัดส่ง:</span>
                <span className="col-span-2 text-slate-200">
                  {cargoDetailsMock[activeModalId].quantity}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-800/40 pb-2">
                <span className="text-slate-500">น้ำหนักบรรทุกสุทธิ:</span>
                <span className="col-span-2 text-emerald-400 font-medium">
                  {cargoDetailsMock[activeModalId].weight}
                </span>
              </div>
              <div className="grid grid-cols-3 pt-1">
                <span className="text-slate-500">ตำแหน่งปัจจุบัน:</span>
                <span className="col-span-2 text-slate-200 text-xs font-sans bg-slate-950 px-2 py-1 rounded border border-slate-800 mt-0.5">
                  {trucksData[activeModalId].locationName}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalId(null)}
                className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
