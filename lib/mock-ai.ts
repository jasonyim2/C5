// Mock AI summarizer - generates realistic-looking demo data from a YouTube URL

const MOCK_SUMMARIES = [
  {
    video_title: 'AI가 바꾸는 미래의 일자리 — 우리가 준비해야 할 것들',
    channel_name: 'Tech Insight Korea',
    summary_3line:
      '인공지능은 반복적 업무를 자동화하여 화이트칼라 직종에도 영향을 미치고 있습니다.\n창의성과 감성 지능이 요구되는 직업군은 AI 시대에도 높은 가치를 유지할 전망입니다.\n지속적인 재교육과 디지털 리터러시 향상이 개인 경쟁력의 핵심으로 부상하고 있습니다.',
    summary_full:
      '이 영상은 인공지능 기술의 발전이 노동 시장에 미치는 심층적인 영향을 분석합니다. GPT-4, Claude 등 대형 언어 모델의 등장으로 데이터 분석, 법률 검토, 의료 진단 등 고도화된 지식 업무조차 AI 보조가 일반화되고 있습니다. 전문가들은 향후 10년간 현재 직업의 약 30%가 AI에 의해 변형 혹은 대체될 것으로 예측합니다. 그러나 동시에 AI 시스템을 감독하고 훈련시키는 새로운 역할이 생겨나고 있으며, 인간 고유의 판단력과 공감 능력이 더욱 중요해질 것입니다. 결론적으로 AI를 도구로 활용하는 능력, 즉 프롬프트 엔지니어링과 데이터 해석 역량을 갖춘 인재가 미래 직업 시장을 주도할 것입니다.',
    keywords: 'AI, 미래직업, 자동화, 노동시장, 디지털전환, 재교육, 생성형AI',
    category: '기술',
  },
  {
    video_title: '2024 스타트업 생존 전략 — 린 스타트업의 진화',
    channel_name: 'Startup Studio',
    summary_3line:
      '린 스타트업 방법론은 고객 검증을 중심에 두는 방향으로 진화하고 있습니다.\n빠른 프로토타입과 데이터 기반 의사결정이 초기 생존율을 3배 높입니다.\nAI 도구를 활용한 소규모 팀의 생산성은 기존 대기업 수준에 근접하고 있습니다.',
    summary_full:
      '스타트업 생태계가 다시 한번 변화의 기로에 서 있습니다. 2024년 현재, 투자 혹한기를 지나며 살아남은 스타트업들의 공통점은 빠른 고객 검증과 철저한 비용 효율성입니다. 에릭 리스의 린 스타트업 개념은 이제 AI 도구와 결합하여 단 5인 팀으로도 수백만 명의 사용자를 서비스할 수 있는 구조를 만들어냈습니다. 특히 노코드/로우코드 플랫폼과 AI 에이전트를 적극 활용하는 팀이 개발 사이클을 80% 단축하는 사례가 속출하고 있습니다. 성공적인 스타트업들은 MVP를 빠르게 출시하고 고객 인터뷰를 주 단위로 반복하는 패턴을 일관되게 유지합니다.',
    keywords: '린스타트업, MVP, 고객검증, 프로덕트마켓핏, AI도구, 노코드, 투자전략',
    category: '비즈니스',
  },
  {
    video_title: 'Next.js 14 완전 정복 — App Router부터 Server Actions까지',
    channel_name: 'Code with Dan',
    summary_3line:
      'Next.js 14의 App Router는 서버 컴포넌트를 기본으로 하여 성능을 대폭 개선합니다.\nServer Actions를 통해 API 라우트 없이 서버 로직을 폼과 직접 연결할 수 있습니다.\nPartial Prerendering으로 정적과 동적 콘텐츠를 하나의 페이지에서 최적화할 수 있습니다.',
    summary_full:
      'Next.js 14는 React Server Components를 전면에 도입하여 웹 개발 패러다임을 전환합니다. App Router는 파일 시스템 기반 라우팅을 유지하면서도 레이아웃 중첩, 로딩 상태, 에러 바운더리를 직관적으로 구성할 수 있게 해줍니다. 가장 주목할 기능인 Server Actions는 클라이언트와 서버 간의 경계를 흐리게 만들어, 폼 제출 시 별도의 API 엔드포인트 없이 서버 함수를 직접 호출합니다. 이를 통해 코드량이 줄어들고 낙관적 업데이트 구현이 간단해집니다. Partial Prerendering은 정적 셸을 즉시 제공하고 동적 데이터를 스트리밍하여 TTFB와 LCP를 동시에 개선하는 혁신적 접근입니다.',
    keywords: 'Next.js, App Router, Server Actions, React, 웹개발, TypeScript, Vercel',
    category: '기술',
  },
];

export function getMockSummary(url: string) {
  const hash = url.length % MOCK_SUMMARIES.length;
  return MOCK_SUMMARIES[hash];
}

export async function simulateAISummary(url: string) {
  const response = await fetch('/api/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (errorData && errorData.error) {
      throw new Error(errorData.error);
    }
    if (response.status === 401) {
      throw new Error('API 키가 필요합니다');
    }
    throw new Error('이 영상은 요약할 수 없습니다');
  }

  return response.json();
}

export function isValidYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');
    return (
      host === 'youtube.com' ||
      host === 'youtu.be' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    );
  } catch {
    return false;
  }
}
