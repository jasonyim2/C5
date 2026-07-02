import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { YoutubeTranscript } from 'youtube-transcript';

export const runtime = 'nodejs'; // Use nodejs runtime for server-side processing
export const maxDuration = 60; // Set max duration to 60 seconds

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL이 필요합니다.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다' }, { status: 401 });
    }

    // 1단계: oEmbed로 메타데이터 조회
    let video_title = '';
    let channel_name = '';
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        video_title = oembedData.title || '';
        channel_name = oembedData.author_name || '';
      } else {
        console.warn('oEmbed fetch failed:', oembedRes.status);
      }
    } catch (e) {
      console.warn('oEmbed error:', e);
    }

    // 2단계: 자막 추출
    let transcriptText = '';
    try {
      // 우선 한국어('ko') 자막을 시도하고, 실패하면 아무 자막이나 가져옵니다.
      let transcript;
      try {
        transcript = await YoutubeTranscript.fetchTranscript(url, { lang: 'ko' });
      } catch (koErr) {
        // 한국어 자막이 없으면 언어 상관없이 가져오기
        transcript = await YoutubeTranscript.fetchTranscript(url);
      }
      
      transcriptText = transcript.map(t => t.text).join(' ');
      
      // 텍스트 길이 제한 (약 3만 자)
      if (transcriptText.length > 30000) {
        transcriptText = transcriptText.substring(0, 30000);
      }
    } catch (e) {
      return NextResponse.json({ error: '이 영상은 자막이 없어 요약할 수 없습니다' }, { status: 422 });
    }

    if (!transcriptText || transcriptText.trim().length === 0) {
      return NextResponse.json({ error: '이 영상은 자막이 없어 요약할 수 없습니다' }, { status: 422 });
    }

    // 3단계: Gemini 텍스트 프롬프팅
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
당신은 유튜브 영상의 자막 텍스트를 분석하고 정확하게 요약하는 전문가입니다.
사용자가 유튜브 영상의 자막 텍스트를 제공하면, 이를 바탕으로 다음 4가지 필드를 포함하는 JSON 형식으로 응답하세요.

{
  "summary_3line": "영상의 핵심 내용을 정확히 3줄로 작성한 요약본",
  "summary_full": "영상 내용 전체를 상세히 요약한 내용",
  "keywords": "영상과 관련된 키워드를 쉼표로 구분한 문자열",
  "category": "카테고리"
}

지시사항:
1. 위 4가지 필드만 포함하세요.
2. 모든 요약 응답은 원본 자막이 외국어라도 반드시 한국어로 작성해야 합니다.
3. category는 반드시 다음 중 하나여야 합니다: 기술, 비즈니스, 교육, 엔터테인먼트, 과학, 건강, 여행, 요리, 기타.
4. summary_3line은 줄바꿈(\\n)을 포함하여 정확히 3줄이 되도록 작성하세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `다음은 영상의 자막입니다:\n\n${transcriptText}\n\n이 자막을 위 지침에 따라 분석해 주세요.` }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json({ error: '요약 생성에 실패했습니다' }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({ error: '응답을 파싱할 수 없습니다.' }, { status: 500 });
    }

    // 4단계: 결과 병합
    return NextResponse.json({
      video_title,
      channel_name,
      ...result
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '서버 내부 오류가 발생했습니다' }, { status: 500 });
  }
}
