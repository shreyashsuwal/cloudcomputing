package samples;
import java.io.BufferedInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.io.*;
import java.net.URL;
import java.net.URLConnection;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class UploadArtistImagesToS3 {

    public static void main(String[] args) throws IOException {
        String bucketName = "s3980059-mybucket";

        AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(Regions.US_EAST_1)
                .build();

        JsonParser parser = new JsonFactory().createParser(new File("a1.json"));
        JsonNode rootNode = new ObjectMapper().readTree(parser);
        JsonNode songsNode = rootNode.get("songs");

        for (JsonNode songNode : songsNode) {
            String imgUrl = songNode.path("img_url").asText();
            String artistName = songNode.path("artist").asText();

            try {
                URL url = new URL(imgUrl);
                InputStream in = new BufferedInputStream(url.openStream());
                ObjectMetadata metadata = new ObjectMetadata();
                metadata.setContentLength(url.openConnection().getContentLength());
                PutObjectRequest request = new PutObjectRequest(bucketName, "artist_images/" + artistName + ".jpg", in, metadata);
                s3Client.putObject(request);
                System.out.println("Uploaded image for artist: " + artistName);
            } catch (IOException e) {
                System.err.println("Error downloading/uploading image for artist: " + artistName);
                e.printStackTrace();
            }
        }
        parser.close();
    }
}
