import Head from "next/head";
//import DataTable from "./DataTable";
//import FuseSearch from "./FuseSearch";
import MapMaker from "./CanvasMap";

const Layout = props => (
  <div>
    <Head>
      <title>Gast Oceanography Collection</title>
    </Head>
    <MapMaker />
    <div>{props.children}</div>
  </div>
);

export default Layout;
