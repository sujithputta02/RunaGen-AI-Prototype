declare module './Landing page/pages/home' {
  import { ComponentType } from 'react';
  export interface HomeProps {
    onEnter?: () => void;
  }
  const Home: ComponentType<HomeProps>;
  export default Home;
}

declare module './Landing page/pages/home.jsx' {
  import { ComponentType } from 'react';
  export interface HomeProps {
    onEnter?: () => void;
  }
  const Home: ComponentType<HomeProps>;
  export default Home;
}
