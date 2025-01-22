import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import MyRoutes from './Routes';

function App() {
  return (
    <BrowserRouter>
    <RecoilRoot>
      <MyRoutes/>
    </RecoilRoot>
    </BrowserRouter>
  );
}

export default App;
