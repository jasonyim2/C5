// Supabase가 완전히 배제된 가짜(Mock) 클라이언트입니다.
// 빌드 에러를 방지하고 환경 변수 의존성을 끊기 위해 실제 초기화 코드를 삭제했습니다.

export const supabase = {
  from: (table: string) => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'DB is disabled' } })
      })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'DB is disabled' } })
      })
    }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    })
  })
} as any;
