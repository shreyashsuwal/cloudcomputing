package samples;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.*;

public class ListObjectsInBucket {

    public static void main(String[] args) {
        String bucketName = "s3980059-mybucket";

        AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                .withRegion(Regions.US_EAST_1)
                .build();

        try {
            System.out.println("Objects in bucket: " + bucketName);
            ObjectListing objectListing = s3Client.listObjects(bucketName);
            for (S3ObjectSummary objectSummary : objectListing.getObjectSummaries()) {
                System.out.println("- " + objectSummary.getKey() + "  (size = " + objectSummary.getSize() + ")");
            }
        } catch (AmazonS3Exception e) {
            System.err.println("Error listing objects in bucket: " + e.getMessage());
        }
    }
}
