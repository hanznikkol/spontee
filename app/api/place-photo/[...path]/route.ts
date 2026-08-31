import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    if (!path || path.length === 0) {
      return new NextResponse("Photo path is required", { status: 400 });
    }

    const photoResource = path.join("/");

    // Validate path to prevent SSRF
    if (!photoResource.startsWith("places/")) {
      return new NextResponse("Invalid photo resource path", { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return new NextResponse("Google Maps API key is not configured", { status: 500 });
    }

    const googlePhotoUrl = `https://places.googleapis.com/v1/${photoResource}/media?maxHeightPx=800&key=${apiKey}`;

    const upstreamResponse = await fetch(googlePhotoUrl, {
      redirect: "follow",
    });

    if (!upstreamResponse.ok) {
      return new NextResponse("Failed to fetch photo from Google Places", {
        status: upstreamResponse.status,
      });
    }

    const contentType = upstreamResponse.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Place Photo Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}