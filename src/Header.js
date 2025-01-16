import {primary45} from "./utils/colors";

export function AddHeader() {
  const styles = {
    container: {
      backgroundColor: primary45,
      color: '#FFF',
      padding: 20,
      fontWeight: 800,
    }
  }
  return <div style={styles.container}>
    <div>Shine-signed</div>
  </div>
}
