import { primary45 } from "../utils/colors";
import { BigButton } from "./BigButton";

export default function PagingControl({totalPages, pageNum, setPageNum}) {
  const styles= {
    container: {
      marginTop: 8,
      marginBottom: 8,
    },
    inlineFlex: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    pageInfo: {
      padding: 8,
      color: primary45,
      fontSize: 14,
    }
  }
  return (
    <div style={styles.container}>
      <div style={styles.inlineFlex}>
        <BigButton
          title={"<"}
          onClick={() => {setPageNum(pageNum - 1); console.log("paging control:", pageNum+1);}}
          disabled={pageNum-1===-1}
        />
        <div style={styles.pageInfo}>
          Page: {pageNum + 1}/{totalPages}
        </div>
        <BigButton
          title={">"}
          onClick={() => {setPageNum(pageNum + 1); console.log("paging control:", pageNum+1);}}
          disabled={pageNum+1>totalPages-1}
        />
      </div>
    </div>
  );
}
