# Use lightweight Nginx image
FROM nginx:alpine

# Copy frontend code into Nginx html folder
COPY ./ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
