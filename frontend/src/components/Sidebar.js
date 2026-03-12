
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaList, FaPlus, FaTachometerAlt, FaCog, FaBars } from "react-icons/fa";


export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const menu = [

      { to: "/", icon: <FaList />, label: "Campagnes" },
        { to: "/create", icon: <FaPlus />, label: "Créer" },

    { to: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
  
  ];

  return (
    <>
    
      <button
        className="fixed top-4 left-4 z-30 bg-[#1a4a65] text-white p-2 rounded-lg shadow-lg focus:outline-none lg:left-72 transition-all"
        style={{ left: collapsed ? '4rem' : '16.5rem' }}
        onClick={() => setCollapsed((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <FaBars className="text-2xl" />
      </button>
      <aside className={`fixed left-0 top-0 h-full ${collapsed ? 'w-16' : 'w-64'} bg-[#add8e6] flex flex-col z-20 shadow-xl transition-all duration-300`}
        style={{ minWidth: collapsed ? '4rem' : '16rem' }}
      >
      
        <div className={`flex items-center justify-center h-16 mt-2`}> 
          <img
            src={collapsed ? process.env.PUBLIC_URL + '/logo512.png' : process.env.PUBLIC_URL + '/logo192.png'}
            alt="Logo"
            className={collapsed ? "w-30 h-30" : "w-41 h-41"}
            style={{ objectFit: 'contain' }}
          />
        </div>
        
        <nav className="flex-1 flex flex-col pt-4">
          {menu.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <div key={item.to} className="relative pl-2">
                <Link
                  to={item.to}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4 px-6'} py-4 font-bold transition-all duration-300 relative ${isActive ? "bg-[#1a4a65] text-white rounded-l-[40px]" : "text-[#1a4a65] hover:bg-white/20 rounded-l-[40px]"}`}
                  title={item.label}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && item.label}
            
                  {isActive && !collapsed && (
                    <>
                      <div className="absolute -top-[20px] right-0 w-[20px] h-[20px] bg-transparent before:absolute before:inset-0 before:rounded-br-[20px] before:shadow-[5px_5px_0_5px_#1a4a65] before:content-['']"></div>
                      <div className="absolute -bottom-[20px] right-0 w-[20px] h-[20px] bg-transparent before:absolute before:inset-0 before:rounded-tr-[20px] before:shadow-[5px_-5px_0_5px_#1a4a65] before:content-['']"></div>
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
        
        <div className={`mt-auto pb-10 ${collapsed ? 'pl-0 flex justify-center' : 'pl-10'}`}>
          <Link to="/settings" className={`flex items-center gap-3 text-[#1a4a65] font-bold hover:opacity-70 transition ${collapsed ? 'justify-center' : ''}`} title="Settings">
            <FaCog className="text-xl" />
            {!collapsed && <span>Setting</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
