import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <div className="portal-header">
        <div className="header-content">
          <img src="https://www.geovictoria.com/hubfs/social-suggested-images/info.geovictoria.comhubfscropped-Logo-WEB-5-1.png" width="112px"/>
          <div className="divider"></div>
          <div className="color-lightblue2">Control de Asistencia</div>
          <div className="divider"></div>
          <input className="gv-input" type="text" placeholder="Buscar..."/>
        </div>
        
        <div className="header-content">
          <div className="info-buttons">
            <i className="fa-light fa-grid-round color-lightblue2"></i>
          </div>
          
          <div className="info-buttons company">
            <div>Empresa</div>
            <img src="https://cdn.countryflags.com/thumbs/chile/flag-round-250.png" height="24px"/>
          </div>

          <div className="info-buttons user">
            <i className="fa-solid fa-circle-user color-lightblue2"></i>
          </div>
        </div>
      </div>
      
      <div className="portal-body">
        <div className="side-menu">
          <i className="fa-light fa-star"></i>
          <i className="fa-light fa-file-lines"></i>
          <i className="fa-light fa-user"></i>
          <i className="fa-light fa-users"></i>
          <i className="fa-light fa-calendar-lines-pen"></i>
          <i className="fa-light fa-gear-complex"></i>
        </div>
        
        <div className="container-fluid">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Planificación</span>
            <i className="fa-light fa-chevron-right"></i>
            <span className="breadcrumb-item current">Calendario de turnos</span>
          </div>
          
          {children}
        </div>
      </div>
    </>
  );
}
