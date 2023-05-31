import { Route, Routes } from 'react-router-dom';

import Edit from './Edit.tsx';

const App = () => (
  <Routes>
    <Route path="/" element={Edit()} />
    <Route path="/test" element={<div>Test</div>} />
    <Route path="*" element={<div>Not Found the Page</div>} />
  </Routes>
);

export default App;
