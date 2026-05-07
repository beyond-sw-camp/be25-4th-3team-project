pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:28.5.1-cli-alpine3.22
    command: ["cat"]
    tty: true
    volumeMounts:
    - name: docker-socket
      mountPath: /var/run/docker.sock
  - name: git
    image: alpine/git:latest
    command: ["cat"]
    tty: true
  volumes:
  - name: docker-socket
    hostPath:
      path: /var/run/docker.sock
      type: Socket
'''
        }
    }

    options {
        // 각 빌드는 중복 실행되지 않도록 한다.
        disableConcurrentBuilds()
    }

    environment {
        BACK_IMAGE = 'leetrue801/autosource-back'
        FRONT_IMAGE = 'leetrue801/autosource-vue'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        GIT_CREDENTIALS_ID = 'github-autosource-app'
        GIT_PUSH_URL = 'git@github.com:beyond-sw-camp/be25-4th-AVG176-project.git'
        K8S_APP_DIR = 'k8s/autosource'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    def changedFilesText = sh(
                        script: '''
                            if git rev-parse HEAD~1 >/dev/null 2>&1; then
                              git diff --name-only HEAD~1 HEAD
                            else
                              git ls-files
                            fi
                        ''',
                        returnStdout: true
                    ).trim()

                    def changedFiles = changedFilesText ? changedFilesText.readLines() : []
                    env.BUILD_BACK = changedFiles.any { it.startsWith('back/') } ? 'true' : 'false'
                    env.BUILD_FRONT = changedFiles.any { it.startsWith('front/') } ? 'true' : 'false'

                    echo "BUILD_BACK: ${env.BUILD_BACK}"
                    echo "BUILD_FRONT: ${env.BUILD_FRONT}"

                    if (env.BUILD_BACK == 'false' && env.BUILD_FRONT == 'false') {
                        echo 'No back/front changes detected. Skipping image build and GitOps update.'
                    }
                }
            }
        }

        stage('Build & Push Images') {
            when {
                expression {
                    return env.BUILD_BACK == 'true' || env.BUILD_FRONT == 'true'
                }
            }
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_PASS'
                    )]) {
                        sh '''
                            echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
                        '''
                    }

                    script {
                        if (env.BUILD_BACK == 'true') {
                            sh """
                                docker build --no-cache -t ${BACK_IMAGE}:${BUILD_NUMBER} ./back
                                docker push ${BACK_IMAGE}:${BUILD_NUMBER}
                            """
                        }

                        if (env.BUILD_FRONT == 'true') {
                            sh """
                                docker build --no-cache \
                                  --build-arg VITE_API_BASE_URL=/api \
                                  --build-arg VITE_OAUTH_BASE_URL= \
                                  -t ${FRONT_IMAGE}:${BUILD_NUMBER} ./front
                                docker push ${FRONT_IMAGE}:${BUILD_NUMBER}
                            """
                        }
                    }

                    sh 'docker logout'
                }
            }
        }

        stage('Update ArgoCD Manifests') {
            when {
                expression {
                    return env.BUILD_BACK == 'true' || env.BUILD_FRONT == 'true'
                }
            }
            steps {
                container('git') {
                    script {
                        if (env.BUILD_BACK == 'true') {
                            sh """
                                sed -i 's|image: ${BACK_IMAGE}:.*|image: ${BACK_IMAGE}:${BUILD_NUMBER}|' ${K8S_APP_DIR}/backend-deployment.yaml
                            """
                        }

                        if (env.BUILD_FRONT == 'true') {
                            sh """
                                sed -i 's|image: ${FRONT_IMAGE}:.*|image: ${FRONT_IMAGE}:${BUILD_NUMBER}|' ${K8S_APP_DIR}/frontend-deployment.yaml
                            """
                        }
                    }

                    sh """
                        git config --global --add safe.directory "${WORKSPACE}"
                        git config user.name "jenkins"
                        git config user.email "jenkins@beyond.com"
                        git status --short ${K8S_APP_DIR}
                    """
                }
            }
        }

        stage('Commit & Push Manifests') {
            when {
                expression {
                    return env.BUILD_BACK == 'true' || env.BUILD_FRONT == 'true'
                }
            }
            steps {
                container('git') {
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'github-autosource-app',
                        keyFileVariable: 'GIT_SSH_KEY'
                    )]) {
                        sh """
                            git add ${K8S_APP_DIR}/backend-deployment.yaml ${K8S_APP_DIR}/frontend-deployment.yaml
                            git commit -m "chore: 이미지 태그 ${BUILD_NUMBER} 업데이트" || exit 0
                            git remote set-url origin ${GIT_PUSH_URL}
                            GIT_SSH_COMMAND="ssh -i ${GIT_SSH_KEY} -o StrictHostKeyChecking=no" git push origin HEAD:main
                        """
                    }
                }
            }
        }
    }

    post {
        failure {
            echo 'Jenkins pipeline failed.'
        }
        success {
            echo 'Jenkins pipeline completed successfully.'
        }
    }
}
