export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      console.log("REQUEST:", body);
  
      // 你的 BMI + AI 逻辑
    } catch (error) {
      console.error("API ERROR:", error); // 👈 关键
  
      return Response.json(
        { error: String(error) },
        { status: 500 }
      );
    }
  }