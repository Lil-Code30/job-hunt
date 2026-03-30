import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const hostname = new URL(url).hostname;
    let source = "Other";
    if (hostname.includes("linkedin")) source = "LinkedIn";
    else if (hostname.includes("wellfound")) source = "Wellfound";
    else if (hostname.includes("greenhouse")) source = "Greenhouse";
    else if (hostname.includes("lever")) source = "Lever";

    return NextResponse.json({
      title: "",
      company: "",
      location: "",
      remote: url.includes("remote"),
      source,
      description: "",
    });
  } catch {
    return NextResponse.json({ error: "Failed to scrape URL" }, { status: 500 });
  }
}