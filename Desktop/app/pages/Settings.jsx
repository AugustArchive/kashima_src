import { remote } from 'electron';

function Sidebar() {
  return <div className='sidebar-right'>

  </div>;
}

function MainPanel() {
  return <div className='settings-main'>
    <Sidebar />
    <div className='actual-settings-main'>
      
    </div>
  </div>;
}

export default MainPanel;