// src/app/api/batchjob/route.js
export async function POST(req) {
  // 실제 배치 작업 로직 추가
  console.log("Batch job - dummy 실행됨");

  // 작업이 성공적으로 완료된 경우 응답 반환
  return new Response(
    JSON.stringify({ message: "Dummy batch job successfully executed" }),
    {
      status: 200,
    }
  );
}

export async function DELETE(req) {
  // 배치 작업 중단 로직 추가
  console.log("Batch job - dummy 중단됨");

  return new Response(JSON.stringify({ message: "Dummy batch job stopped" }), {
    status: 200,
  });
}
