import EmailInputModal from "../components/SignPage/EmailInputModal";

const CheckEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [isValid, setIsValid] = useState(null);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("❌ 유효하지 않은 접근입니다.");
      return;
    }
  
    ApiService.checkSignatureToken(token)
      .then(() => {
        setIsValid(true);
      })
      .catch((err) => {
        setIsValid(false);
        const errorMessage = err.message || "⚠️ 서명 요청 검증에 실패했습니다.";
        setError(errorMessage);
        alert(errorMessage); // ✅ 사용자에게 알림
      });
  
    console.log("전역 변수 signing:", signing);
  }, [token]);

  return (
    <div>
        <EmailInputModal
          open={true}
          onSubmit={handleEmailSubmit}
          onClose={() => {}} // 닫기 버튼 비활성화
        />
    </div>
  );
}
export default CheckEmailPage;