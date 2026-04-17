import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

/**
 * 시트 객체를 가져오고, 비어있을 경우 헤더를 자동으로 생성합니다.
 */
export async function getSheet() {
  // 환경 변수가 설정되지 않았을 때의 예외 처리 (앱이 죽지 않도록)
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SPREADSHEET_ID) {
    throw new Error("구글 시트 연동을 위한 .env.local 환경 변수가 설정되지 않았습니다.");
  }

  // 1. 서비스 계정 인증
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // 줄바꿈 오류 해결을 위한 replace 처리
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  // 문서 객체 생성
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth);

  try {
    await doc.loadInfo();
  } catch (error) {
    throw new Error("구글 시트에 접근할 수 없습니다. 권한이나 설정(Spreadsheet ID, Private Key)을 확인해주세요.");
  }
  
  let sheet = doc.sheetsByTitle["FranklinDiary"];

  
  if (!sheet) {
    sheet = await doc.addSheet({ title: "FranklinDiary" });
  }

  // 데이터가 아예 없는 경우 (헤더도 없는 경우) 헤더 추가
  const rows = await sheet.getRows();
  if (rows.length === 0 && sheet.headerValues.length === 0) {
    try {
        await sheet.setHeaderRow([
            "task_id", 
            "date", 
            "cutoff_date", 
            "title", 
            "priority", 
            "status", 
            "due_time", 
            "category", 
            "created_at", 
            "updated_at"
        ]);
    } catch (e) {
        // 이미 설정되어 있거나 에러가 발생한 경우 무시
        console.error("Header setting failed:", e);
    }
  }

  return sheet;
}
